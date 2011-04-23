function $(id) {
  return document.getElementById(id);
}

$("room").value = localStorage["room"] || "";
chrome.extension.sendRequest({status: "popup"}, function(response) {
  console.log(response);
  if (response.status == "stopped") {
    $("join").addEventListener("click", function(event) {
      var room = $('room').value;
      if (room) {
        chrome.extension.sendRequest({status: "start", room: room});
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
