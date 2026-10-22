
const { archiveOldMessages } = require("./jobs/archiveMessages");

archiveOldMessages()
    .then(() => {
        console.log("Manual archive test completed.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Manual archive test failed:", error);
        process.exit(1);
    });
