var OwnerId = "872087832628441088"
$.ajax({
  url: "https://api.lanyard.rest/v1/users/" + OwnerId,
  type: "GET",
  success: function(res) {
    var data = res.data;
    var user_data = data.discord_user;
    var avatar_img = "https://cdn.discordapp.com/avatars/" + OwnerId + "/" + user_data.avatar + ".png?size=1024"
    console.log(user_data.avatar); $(".avatar-img").attr("src", avatar_img)
    $(".discord-status").removeAttr("style")
    $(".discord-status").attr("class", $(".discord-status").attr("class") + " " + data.discord_status)
    $(".owner-name").text("(" + user_data.username + "#" + user_data.discriminator + ")")
  }
});

function connectToLink(url) {
  location.href = url;
};

function copyText(txt) {
  navigator.clipboard.writeText(txt);
  showMessage("클립보드에 복사되었습니다!");
};

function showMessage(txt) {
  frame = $(".message-frame");
  old_class = "message-frame ui message-hide";
  frame.text(txt);
  frame.attr("class", "message-frame ui message-show");
  setTimeout(function() {
    frame.attr("class", old_class);
  }, 1000);
};

function sendDiscord(message) {
  const request = new XMLHttpRequest();
  request.open("POST", "https://discordapp.com/api/webhooks/676118118082281513/ZS5YcWhurzokBrKX9NgexqtxrJA5Pu2Bo4i7_JsIxC-JIbPBVhSZkcVVukGOro52rnQA");
};