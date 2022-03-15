var Steam = require("steam"),
  events = require("events"),
  eventEmitter = new events.EventEmitter(),
  eventEmitter1 = new events.EventEmitter(),
  fs = require("fs"),
  util = require("util"),
  csgo = require("csgo"),
  csv = require("fast-csv"),
  community = require("steam-community"),
  communityClient = community(),
  SteamWebLogOn = require("steam-weblogon"),
  logger = fs.createWriteStream("output.csv", {
    flags: "a",
  });
const SteamClient = require("steam-client");
const SteamUser = require("steam-user");
let client = new SteamClient.CMClient();
let user = new SteamUser({ enablePicsCache: true });
const waitForAll = require("wait-for-event").waitForAll;

function getinfo(username, password, email, emailPassword) {
  try {
    util.log("[rKiller]Attempting login on [" + username + "] ***");

    var botInstance = new Steam.SteamClient(),
      steamU = new Steam.SteamUser(botInstance),
      steamF = new Steam.SteamFriends(botInstance),
      steamWebLogOn = new SteamWebLogOn(botInstance, steamU),
      csgoGameCoordinator = new Steam.SteamGameCoordinator(botInstance, 730),
      gameCoordinatorHandle = new csgo.CSGOClient(
        steamU,
        csgoGameCoordinator,
        false
      ),
      logOnDetails = {
        account_name: username,
        password: password,
      };

    botInstance.connect();
    var onLoginSuccess = function onLoginSuccess(response) {
      var vac;
      var prime;
      var p_rank;
      steam64 = botInstance.steamID;
      var steamlink = "http://steamcommunity.com/profiles/" + steam64;
      util.log("[rKiller]Got Steam URL (" + steam64 + ") ***");

      steamF.getSteamLevel([steam64], function (result) {
        if (!result) return console.log("err");
        s_level = result[steam64];
      });

      if (response.eresult != Steam.EResult.OK) {
        result = "[rKiller]Error while trying to login!";
      } else {
        util.log("[rKiller]Login for [" + username + "] Successfull ***");
      }

      var writeResults = function () {
        try {
          csv
            .write(
              [
                [
                  username,
                  password,
                  email,
                  emailPassword,
                  prime,
                  vac,
                  steamlink,
                ],
              ],
              {
                headers: true,
              }
            )
            .pipe(logger);
          logger.write("\r\n");
          util.log("[rKiller]Results saved @ output.csv for " + args[0]);
          console.log(
            "------------------------------------------------------------------------------------------------"
          );
          botInstance.disconnect();
        } catch (e) {
          console.log(e);
        }
      };

      waitForAll("got", [eventEmitter, eventEmitter1], writeResults);
      try {
        gameCoordinatorHandle.launch();
      } catch (e) {
        util.log(e);
      }
      util.log(
        "[rKiller]Talking to our Lord And Savior Gaben about [" +
          username +
          "] ***"
      );
      gameCoordinatorHandle.on("unready", function onUnready() {
        util.log("node-csgo unready.");
      });
      gameCoordinatorHandle.on("error", function () {
        util.log(gameCoordinatorHandle);
      });
      gameCoordinatorHandle.on("ready", function () {
        gameCoordinatorHandle.playerProfileRequest(
          gameCoordinatorHandle.ToAccountID(botInstance.steamID)
        );
        gameCoordinatorHandle.on("playerProfile", function (profile) {
          if (!profile) return console.log("err");
          try {
            vac = profile.account_profiles[0].vac_banned == null ? "No" : "Yes";
            util.log("[rKiller]Got Vac Status = (" + vac + ") ***");
            prime =
              profile.account_profiles[0].player_level == null ? "No" : "Yes";
            util.log("[rKiller]Got Prime Status = (" + prime + ") ***");
            eventEmitter1.emit("got");
          } catch {}
          writeResults();
        });
      });
    };

    botInstance
      .on("logOnResponse", onLoginSuccess)
      .on("connected", function (err) {
        if (err) return console.log("error");
        steamU.logOn(logOnDetails);
      });
  } catch {
    console.log("error");
  }
}
var args = process.argv.slice(2);
checkApp(args[0], args[1], args[2], args[3]);
function checkApp(username, password, email, emailPassword) {
  user.logOn({
    accountName: username,
    password: password,
  });

  user.on("appOwnershipCached", async function (details) {
    util.log("Logged into Steam as " + user.steamID.getSteam3RenderedID());
    let mass = user.getOwnedApps();
    console.log(contains(mass, 730));
    if (contains(mass, 730) !== true) {
      try {
        util.log(`Account doesnt have a CSGO`);
        logger.write(`\r\n${username},${password},${email},${emailPassword}`);
        util.log("[rKiller]Results saved @ output.csv for " + username);
        console.log(
          "------------------------------------------------------------------------------------------------"
        );
      } catch (e) {
        console.log(e);
      }
      setTimeout(process.exit(1), 5000);
      return;
    }
    await user.logOff();
    getinfo(username, password, email, emailPassword);
  });
}

function contains(arr, elem) {
  return arr.find((i) => i === elem) != -1;
}
