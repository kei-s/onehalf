function $(id) {
  return document.getElementById(id);
}

$("channel").value = localStorage["channel"] || "";
chrome.extension.sendRequest({status: "popup"}, function(response) {
  console.log(response);
  if (response.status == "stopped") {
    $("join").addEventListener("click", function(event) {
      var channel = $('channel').value;
      if (channel) {
        chrome.extension.sendRequest({status: "start", channel: channel});
      }
      window.close();
    });
  }
  else if (response.status == "started" && response.target == "this") {
    chrome.extension.sendRequest({status: "stop"});
    window.close();
  }
  else if (response.status == "started" && response.target == "other") {
    chrome.extension.sendRequest({status: "focus"});
    window.close();
  }
});
