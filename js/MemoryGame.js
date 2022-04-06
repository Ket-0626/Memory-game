
/**
 * @namespace The 
 */
var MemoryGame = {

  settings: {
    rows: 2,
    columns: 3,
    images: 3, 
  },

  cards: [], 
  attempts: 0, 
  mistakes: 0, 
  isGameOver: false,

  /**
   * @param {number} columns
   * @param {number} rows
   * @param {number} number
   * @return {array} 
   */
  initialize : function(rows, columns, images) {
    var validOptions = true;


    if (!(typeof columns === 'number' && (columns % 1) === 0 && columns > 1) ||
        !(typeof rows === 'number' && (rows % 1) === 0) && rows > 1) {
      validOptions = false;
      throw {
        name: "invalidInteger",
        message: "Both rows and columns need to be integers greater than 1."
      };
    }

    if ((columns * rows) % 2 !== 0) {
      validOptions = false;
      throw {
        name: "oddNumber",
        message: "Either rows or columns needs to be an even number."
      };
    }

    if (validOptions) {
      this.settings.rows = rows;
      this.settings.columns = columns;
      this.settings.images = images;
      this.attempts = 0;
      this.mistakes = 0;
      this.isGameOver = false;
      this.createCards().shuffleCards();
    }

    return this.cards;
  },

  /**
   * @return 
   */
  createCards: function() {
    var cards = [];
    var values = [];
    var count = 0;
    var maxValue = (this.settings.columns * this.settings.rows) / 2;
    while (count < maxValue) {
      var value = this.getRandomCardValue(values);
      cards[2 * count] = new this.Card(value);

      cards[2 * count + 1] = new this.Card(value, true);
      count++;
    }

    this.cards = cards;

    return this;
  },

  /**
   * @param {array} values
   * @return {number}
   */
  getRandomCardValue: function(values) {
    var valid = false;
    var randomValue = 0;

    while (!valid) {
      randomValue = Math.floor(Math.random() * this.settings.images) + 1;
      var found = false;
      for (var index = 0; index < values.length; index++) {
        if (randomValue === values[index]) {
          found = true;
          break;
        }
      }
      if (!found) {
        valid = true;
        values.push(randomValue); 
      }
    }

    return randomValue;
  },

  /**
   * @return
   */
  shuffleCards: function() {
    var cards = this.cards;
    var shuffledCards = [];
    var randomIndex = 0;

    while (shuffledCards.length < cards.length) {

      randomIndex  = Math.floor(Math.random() * cards.length);

      if(cards[randomIndex]) {

        shuffledCards.push(cards[randomIndex]);

        cards[randomIndex] = false;
      }

    }

    this.cards = shuffledCards;

    return this;
  },

  /**
   * @param {number} Index
   * @return {object} 
   */
  play: (function() {
    var cardSelection = [];
    var revealedCards = 0;
    var revealedValues = [];

    return function(index) {
      var status = {};
      var value = this.cards[index].value;

      if (!this.cards[index].isRevealed) {
        this.cards[index].reveal();
        cardSelection.push(index);
        if (cardSelection.length == 2) {
          this.attempts++;
          if (this.cards[cardSelection[0]].value !=
              this.cards[cardSelection[1]].value) {
            this.cards[cardSelection[0]].conceal();
            this.cards[cardSelection[1]].conceal();
            var isMistake = false;

            if (revealedValues.indexOf(this.cards[cardSelection[0]].value) === -1) {
              revealedValues.push(this.cards[cardSelection[0]].value);
            }
            else {
              isMistake = true;
            }

            if (revealedValues.indexOf(this.cards[cardSelection[1]].value) === -1) {
              revealedValues.push(this.cards[cardSelection[1]].value);
            }

            if (isMistake) {
              this.mistakes++;
            }

            revealedValues.push(this.cards[cardSelection[0]].value);

            status.code = 3,
            status.message = 'No Match. Conceal cards.';
            status.args = cardSelection;
          }
          else {
            revealedCards += 2;
            if (revealedCards == this.cards.length) {
              this.isGameOver = true;
              revealedCards = 0;
              revealedValues = [];
              status.code = 4,
              status.message = 'GAME OVER! Attempts: ' + this.attempts +
                  ', Mistakes: ' + this.mistakes;
            }
            else {
              status.code = 2,
              status.message = 'Match.';
            }
          }
          cardSelection = [];
        }
        else {
          status.code = 1,
          status.message = 'Flip first card.';
        }
      }
      else {
        status.code = 0,
        status.message = 'Card is already facing up.';
      }

      return status;

    };
  })()

};
