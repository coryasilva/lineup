import { Player, createCollection } from './player.js'
import { sortPlayersByName } from './lineup.js'

/**
 * Recovers a saved json string or an empty array
 * @param {string} key localstorage key
 * @return {Player[]}
 */
export function fetch(key) {
  // fetch from localstorage
  var players = parsePlayersJson(localStorage.getItem(key))

  // fetch from URL
  var urlPlayers = parsePlayersUrlHash(window.location.hash)
  if (urlPlayers.length > 0) {
    players = urlPlayers
  }

  return sortPlayersByName(players)
}

/**
 * Saves the players array as a json string
 * @param {string} key localstorage key
 * @param {Array} players
 */
export function save(key, players) {
  // Save to URL
  window.location.hash = buildPlayersUrlHash(players)

  // Save to LocalStorage
  localStorage.setItem(key, JSON.stringify(players))
}

/**
 * Saves the players array as a json string
 * @param {Array} players
 * @return {string}
 */
export function buildPlayersUrlHash(players) {
  return createCollection(players).reduce((acc, player, index) => {
    acc += index != 0 ? '&player=' : 'player='
    return acc += player.toUrlParam()
  }, '')
}

/**
 * Naively parses a string for player parameters.  Does not consider any other params...
 * @param {string} hash
 * @return {Players[]}
 */
export function parsePlayersUrlHash(hash) {
  // Add an ampersand to make url params uniform for splitting
  let decodedHash = '&' + decodeURIComponent(hash)

  // Get tail of array (ignoring the first split ara)
  let urlPlayers = decodedHash.split('&player=').slice(1)

  return createCollection(urlPlayers.map(value => value.split('~')))
}

/**
 * Parse json array of players
 * @param {string} json
 * @return {Players[]}
 */
export function parsePlayersJson(json) {
  return createCollection(JSON.parse(json || '[]'))
}
