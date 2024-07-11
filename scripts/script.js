// Variables
// import langSettings from "../settings/lang.json" //with {type: "json"};
// import settings from "../settings/settings.json" //with {type: "json"};
// import buttons from "../settings/buttons.json" //with {type: "json"};

let langSettings;
let settings;
let buttons;

importSettings();

const ownerId = settings.ownerId;
const reloadInterval = settings.reloadInterval;
const activeDevices = ["_web", "_desktop", "_mobile"];
const birthDate = new Date(settings.birthTimestamp * 1000);
const currentDate = new Date();

let langIndex = settings.supportedLangs.indexOf(navigator.language);
let nextLang = langIndex;
let currectLang = langIndex >= 0 ? settings.supportedLangs[langIndex] : settings.defaultLang;

let lastData = {
  lastAvatar: "",
  lastStatus: "",
  lastDecoration: "",
  lastDevice: "_offline",
};

// Functions
function onImageLoaded(){
  $("#profile-loading").css("display", "none");
};

function getAge(isKoreanAge){
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  
  if(isKoreanAge){
    age++;
  }else{
    let m = currentDate.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
    }
  }

  return age;
};

function loadDiscordStatus(){
  $.ajax({
    url: "https://api.lanyard.rest/v1/users/" + ownerId,
    type: "GET",

    success: function(res) {
      let data = res.data;
      let user_data = data.discord_user;
      let decoration_data = user_data.avatar_decoration_data;
      let decoration_img = decoration_data != null ? "https://cdn.discordapp.com/avatar-decoration-presets/{0}.png".format(decoration_data.asset) : null
      let avatar_img = "https://cdn.discordapp.com/avatars/{0}/{1}?size=256".format(ownerId, user_data.avatar);

      if(lastData.lastAvatar != avatar_img) $("#avatar-img").attr("src", avatar_img);
      if(lastData.lastStatus != data.discord_status) $("#discord-status").attr("class", data.discord_status);

      if(decoration_img != null){
        if(decoration_img != lastData.lastDecoration){
          $("#avatar-deco").css("display", "block");
          $("#avatar-deco").attr("src", decoration_img);
        }
      }else{
        $("#avatar-deco").css("display", "none");
      }

      $("#user-name").text("{0}\n(@{1})".format(user_data.display_name, user_data.username));

      lastData.lastAvatar = avatar_img;
      lastData.lastDecoration = decoration_img;
      lastData.lastStatus = data.discord_status;
      
      let deviceFound = false;

      for(let i in activeDevices){
        if(data["active_on_discord{0}".format(activeDevices[i])]){
          lastData.lastDevice = activeDevices[i];
          deviceFound = true;
          break;
        }
      }

      if(!deviceFound) lastData.lastDevice = "_offline";
    }
  });
};

function showDiscordStatusMessage(){
  $("#status-info").text("{0} | {1}".format(langSettings.device_texts[currectLang][lastData.lastDevice], langSettings.status_texts[currectLang][lastData.lastStatus]));
  $("#status-info").addClass("status-hover");
};

function hideDiscordStatusMessage(){
  $("#status-info").removeClass("status-hover");
};

function changeLangBtnText(){
  if(langIndex >= settings.supportedLangs.length){
    langIndex = 0;
    nextLang = 1;
  }

  if(langIndex == settings.supportedLangs.length-1){
    nextLang = 0;
  }

  $("#current-lang").text(langSettings.lang_texts[settings.supportedLangs[nextLang]]);
};

function reloadButtonTexts(){
  $.each(document.querySelectorAll(".bottom-btn"), (_, dom) => {
    let button = $(dom);

    button.text(langSettings.button_texts[button.attr("id").replace("btn_", "")][currectLang])
  });
};

function reloadTexts(){
  let langList = langSettings.ui_texts[currectLang];
  let formatData = {
    name: settings.profileName,
    timeZone: settings.timeZone,
    birthday: birthDate.toLocaleDateString(currectLang, settings.birthdayOptions),
    age: getAge(),
    krAge: getAge(true),
  };

  $.each(langList, (index, value) => {
    $("#{0}".format(index)).text(value.format(formatData));
  });

  reloadButtonTexts();
  changeLangBtnText();
};

function changeLang(){
  if(langIndex == -1){
    langIndex = settings.supportedLangs.indexOf(settings.defaultLang);
    nextLang = langIndex;
  }

  langIndex += 1;
  nextLang += 1;

  if(langIndex >= settings.supportedLangs.length){
    langIndex = 0;
    nextLang = 1;
  }

  currectLang = settings.supportedLangs[langIndex];
  
  reloadTexts();
};

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
};

function removeMessage(message){
  message.addClass("hide");
  if (message[0].timeoutId) clearTimeout(message[0].timeoutId);
  setTimeout(() => message.remove(), 500);
};

function createMessage(text, icon){
  let uuid = uuidv4();

  $("#message-holder").append(`
  <li class="toast ${uuid} button">
    <div class="column">
      <i class="fa-solid ${icon || "fa-circle-check"}"></i>
      <span>${text}</span>
    </div>
  </li>
  `);

  let message = $(`.${uuid}`);
  message[0].timeoutId = setTimeout(() => removeMessage(message), 5000);
  message.click(() => removeMessage(message));
};

function copyText(text){
  navigator.clipboard.writeText(text);

  createMessage(langSettings.notifications.copied[currectLang]);
};

function createButtons(){
  $.each(buttons, (index, line) => {
    $("#button-holder").append(`<div id="line{0}" class="row button-row"></div>`.format(index));

    $.each(line, (_, button) => {
      $("#line{0}".format(index)).append(`<div id="btn_{0}" class="button bottom-btn col center-text">button</div>`.format(button.id));

      let created = $("#btn_{0}".format(button.id));
      if(button.link){
        created.click(() => {
          if(button.new_tab){
            window.open(button.link, '_blank').focus();
          }else{
            location.href = button.link;
          }
        });
      }else if(button.copy_text){
        created.click(() => {
          copyText(button.copy_text);
        });
      }
    });

    if(index == buttons.length-1){
      $("#line{0}".format(index)).addClass("last-row");
    }
  });
};

function importLang(){
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/settings/lang.json",
      method: "GET",
      async: false,
      success: function(response){
        langSettings = response;
        resolve(response);
      },
      error: function(error){
        importLang()
      }
    })
  });
}

function importPageSettings(){
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/settings/settings.json",
      method: "GET",
      async: false,
      success: function(response){
        settings = response;
        resolve(response);
      },
      error: function(error){
        importPageSettings()
      }
    })
  });
}

function importButtons(){
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/settings/buttons.json",
      method: "GET",
      async: false,
      success: function(response){
        buttons = response;
        resolve(response);
      },
      error: function(error){
        importButtons()
      }
    })
  });
}

async function importSettings() {
  return await Promise.all([
    importLang(),
    importPageSettings(),
    importButtons(),
  ]);
}

String.prototype.format = function() {
  let formatted = this;

  if(arguments.length == 1 && typeof(arguments[0]) == "object"){
    for(let arg in arguments[0]) {
      formatted = formatted.replace("{" + arg + "}", arguments[0][arg]);
    }
  }else{
    for(let arg in arguments) {
      formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
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
  $("#avatar-img").on("load", onImageLoaded);
  $("#lang-button").click(changeLang);
  $("#discord-status").hover(showDiscordStatusMessage, hideDiscordStatusMessage);

  if(settings.supportedLangs.length <= 1){
    $("#lang-button").css("display", "none");
  }

  settings.birthdayOptions.timeZone = settings.timeZone

  createButtons();
  reloadTexts();
  loadDiscordStatus();
  setInterval(loadDiscordStatus, reloadInterval * 1000);
})