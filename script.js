// Variables
let ownerId = "872087832628441088";

// Functions
function onImageLoaded(){
  $("#profile-loading").css("display", "none");
}

function loadDiscordStatus(){
  $.ajax({
    url: "https://api.lanyard.rest/v1/users/" + ownerId,
    type: "GET",
    success: function(res) {
      let data = res.data;
      let user_data = data.discord_user;
      let decoration_data = user_data.avatar_decoration_data;
      let decoration_img = decoration_data != null ? "https://cdn.discordapp.com/avatar-decoration-presets/{0}.png".format(decoration_data.asset) : null
      let avatar_img = "https://cdn.discordapp.com/avatars/" + ownerId + "/" + user_data.avatar + "?size=256";

      $("#avatar-img").attr("src", avatar_img)
      $("#discord-status").attr("class", $("#discord-status").attr("class") + " " + data.discord_status)

      if(decoration_img != null){
        $("#avatar-deco").css("display", "block")
        $("#avatar-deco").attr("src", decoration_img)
      }else{
        $("#avatar-deco").css("display", "none")
      }

      $("#user-name").text("{0}\n(@{1})".format(user_data.display_name, user_data.username))
    }
  });
}

String.prototype.format = function() {
  let formatted = this;

  for(let arg in arguments) {
      formatted = formatted.replace("{" + arg + "}", arguments[arg]);
  }

  return formatted;
};

// $.ajax({
//   url: "https://api.lanyard.rest/v1/users/" + OwnerId,
//   type: "GET",
//   success: function(res) {
//     var data = res.data;
//     var user_data = data.discord_user;
//     var avatar_img = "https://cdn.discordapp.com/avatars/" + OwnerId + "/" + user_data.avatar + ".png?size=1024"
//     console.log(user_data.avatar); $(".avatar-img").attr("src", avatar_img)
//     $(".discord-status").removeAttr("style")
//     $(".discord-status").attr("class", $(".discord-status").attr("class") + " " + data.discord_status)
//     $(".owner-name").text("(" + user_data.username + "#" + user_data.discriminator + ")")
//   }
// });

// function connectToLink(url) {
//   location.href = url;
// };

// function copyText(txt) {
//   navigator.clipboard.writeText(txt);
//   showMessage("클립보드에 복사되었습니다!");
// };

// function showMessage(txt) {
//   frame = $(".message-frame");
//   old_class = "message-frame ui message-hide";
//   frame.text(txt);
//   frame.attr("class", "message-frame ui message-show");
//   setTimeout(function() {
//     frame.attr("class", old_class);
//   }, 1000);
// };

// Initialize
$(document).ready(() => {
  $("#avatar-img").on("load", onImageLoaded)

  loadDiscordStatus()
})