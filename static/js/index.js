async function submitForProcessing(url) {
    sectionInput.classList.remove("active");
    sectionScan.classList.add("active");
    progressLabel.innerText = "Submitting for analysis...";
    progressBar.style.width = "0%";

    const response = await fetch("/process_repo", {method: "post", body: JSON.stringify({query: url})});
    const reader = response.body.getReader();
    while (true) {
        const {value, done} = await reader.read();
        try {
            const {status} = JSON.parse(new TextDecoder("utf-8").decode(value));

            if (status === "rejected") return rejectUserQuery();
            else if (status === "cached") {
                window.location.href = `/graph?query=${encodeURIComponent(url)}`;
                return;
            }
            progressLabel.innerText = status;
            const progress = /\((\d+)\/(\d+)\)/.exec(status);
            if (progress) {
                const realProgress = 100*Number(progress[1])/Number(progress[2]);
                const guessProgress = 100-300/Math.log(Number(progress[1])+20);
                // rough estimation of scale when recursively expanding the dependency graph
                progressBar.style.width = (guessProgress+realProgress)/2+"%";
            }
        } catch (e) {
        } // ignore empty lines

        if (done) {
            window.location.href = `/graph?query=${encodeURIComponent(url)}`;
            return;
        }
    }
}

function rejectUserQuery() {
    sectionInput.classList.add("active");
    sectionScan.classList.remove("active");
    errorLabel.innerText = "Please check that you entered a valid publicly available repository URL.";
}

const sectionInput = document.getElementById("section_input");
const sectionScan = document.getElementById("section_scan");

const repoInput = document.getElementById("repo_input");
const errorLabel = document.getElementById("error_label");
const progressLabel = document.getElementById("progress_label");
const progressBar = document.getElementById("scan_progress");

repoInput.onkeyup = evt => {
    if (evt.keyCode === 13) submitForProcessing(repoInput.value).then(() => {});
};

// if url set, submit for processing immediately
const query = new URL(window.location).searchParams.get("query");
if (query) submitForProcessing(query);
