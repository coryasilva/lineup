import * as datastore from './datastore.js'
import { Player } from './player.js'
import { determineLineup, filterActivePlayers, demo } from './lineup.js'

export const STORAGE_KEY = 'lineup!'

export default new Vue({
  el: '#app',
  data: {
    players: datastore.fetch(STORAGE_KEY),
    wasValidated: false,
    lineup: {}
  },
  computed: {
    activePlayersCount: function () {
      return filterActivePlayers(this.players).length
    }
  },
  methods: {
    buildLineup: function (e) {
      // stop form submission
      e.preventDefault()

      // early return if form is invalid
      var form = e.target
      if ( !form.checkValidity() ) {
        this.scrollToInvalidField(form)
        this.wasValidated = true
        return
      }

      // Clear validation styling
      this.wasValidated = false

      // Vue JS does not like classes??? so we create a new array of Players
      // This is probably better as not to mess with the observed array...
      let players = this.players.map(player => player = new Player().populate(player))
      this.lineup = determineLineup(players)
      this.modal('show')
    },
    addPlayer: function () {
      this.players.push(new Player())
    },
    deletePlayer: function (index) {
      this.players.splice(index, 1)
    },
    scrollToInvalidField: function (formEl) {
      var $form = $(formEl)
      $('html, body').animate({
        scrollTop: $form.find('input:invalid').offset().top - 100
      }, 750)
    },
    modal: function (command) {
      $('.lineup-modal').modal('show')
    },
    demo: function () {
      var confirm = true;
      if (this.players.length > 0) {
        confirm = window.confirm('This will erase your current players, do you want to continue?')
      }
      if (confirm) {
        this.players = demo()
      }
    }
  },
  watch: {
    players: {
      handler: function (newValue) {
        datastore.save(STORAGE_KEY, this.players);
      },
      deep: true
    }
  }
})
