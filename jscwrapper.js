class JSCWrapper {
    targetFrame = null
    targetFrameContent = null

    settings = null
    constructor() {}

    omnisSetOptions(options) {
        console.log("omnisSetOptions", options)
        this.settings = options

        if (options.jsclienturl) {
            this.targetFrame = document.getElementById("frm1")
            if (this.targetFrame) {
                this.targetFrame.src = options.jsclienturl
                this.targetFrameContent = this.targetFrame.contentWindow
            }
        }

        // Hide the loading overlay
        if (!options.showLoadingOverlay) {
            this.hideLoadingOverlay()
        }
    }

    omnisOnLoad() {
        console.log("omnisOnLoad")

        window.addEventListener("message", (e) => {
            // e.origin
            let data
            try {
                data = JSON.parse(e.data)
            } catch (e) {
                data = {}
                console.error(e)
            }

            if (data.type !== "JSC_WRAPPER") return

            if (data.id === "PAGE_LOADING_COMPLETED") { // Special message to hide the loader when the page loading is completed
                this.hideLoadingOverlay()
            }

            this.sendMessageToFatClient(data.id, data.data)
        })
    }

    omnisOnWebSocketOpened(port) {
        this.sendMessageToFatClient("CONTROL_READY", null) // Notify the developer that the web socket is now open, so you can now use $callMethod() etc.
    }

    sendMessageToJSClient(row) {
        console.log("send message to JSClient", row)

        this.targetFrameContent.postMessage(
            JSON.stringify({
                type: "JSC_WRAPPER",
                id: row.id,
                data: row.data,
            }),
            "*"
        )
        // return false

        // try {
        //     var inst = jOmnis.omnisInsts[0]
        //     var form = row["form"] ? inst.formGet(inst.formFindByName(row.form)) : inst.formGet(-1)
        // } finally {
        //     if (form) form.callMethodEx("htmlcontrolMessage", 0, row.messageID, row.data)
        //     else {
        //         // If the form is not loaded yet, try again in 50ms:
        //         setTimeout(function () {
        //             jControl.callbackObject.sendMessageToJSClient(row)
        //         }, 50)
        //     }
        // }
    }

    /**
     * Called by JavaScript code in the running Remote Form to send a message to the Fat client.
     * @param id					An identifier for the message.
     * @param data				The data payload to send.
     */
    sendMessageToFatClient(id, data) {
        //console.log("send message to fat client", id, data)
        jControl.sendControlEvent({ id: id, data: data }, true)
    }


    hideLoadingOverlay() {
        const loader = document.querySelector("#loader-container")
        if (loader) loader.style.display = "none"
    }
}
jControl.callbackObject = new JSCWrapper()

// {
//     "data": "all",

//     "options": {
//         "jsclienturl": ""
//     },

//     "optionsDescriptions": {
//         "jsclienturl": "URL of the page with the JSClient instance"
//     }
// }
