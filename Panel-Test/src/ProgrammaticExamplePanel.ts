import "magx-panel/dist/Panel-Black-Tiny.css";
import "magx-panel";
import { MagxPanel, MagxPanelFileChooser, MagxPanelImage, MagxPanelProgressBar, MagxPanelTextArea, MagxPanelTime } from "magx-panel";

const panel = new MagxPanel();
panel.title = "Programmatic Panel";
panel.setOutOfBoundsCheck(true);

const time = new MagxPanelTime();
time.title = "Choose Time";
panel.appendChild(time);

const filechooser = new MagxPanelFileChooser();
filechooser.title = "File Chooser";
filechooser.placeholderLabel = "Click here, pick a file!";
panel.appendChild(filechooser);

const image = new MagxPanelImage();
image.title = "Example Image";
image.setValue("./testimage.jpg");
panel.appendChild(image);

const progressBar = new MagxPanelProgressBar();
progressBar.title = "Progress Bar";
progressBar.maxValue = 100;
progressBar.currentValue = 0;
panel.appendChild(progressBar);

const textArea = new MagxPanelTextArea();
textArea.title = "Text Area";
textArea.placeholder = "Replace this placeholder text..";
panel.appendChild(textArea);

let progressBarCount = 0;
setInterval(() => {    
    progressBar.currentValue = progressBarCount;
    progressBarCount = (progressBarCount + 1) % 101;
}, 150);

document.body.appendChild(panel);
setTimeout(() => { panel.setPosition(25, 25); }, 10);


