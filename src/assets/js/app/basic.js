var $ = require('jquery');

module.exports = function() {
  'use strict';

  var pluginName = "pluginName",
      defaults = {
        el : '.js-div',
        query : [
          window.matchMedia("screen and (min-width: 860px)"),
          window.matchMedia("screen and (min-width: 480px)")
                ]
      },
      plugins = [],
      index = 0;

  // The plugin constructor
  function Plugin( element, options ) {
    this.options =  $.extend({}, defaults, options); // raw query options
    //this.mm = window.matchMedia(this.options.query);
    this.mm = {};
    this.el = this.options.el;
    this.$el = $(this.el);
    this.element = element;
    this.self = $(this.element); //this is the item instance
    this.init();
  }
  Plugin.prototype = {

    // Handle the media query event, add and remove the trigger click listener
    handleQuery : function(mql) {
      switch(mql.media) {
        case "screen and (min-width: 860px)":
            if(mql.matches){
              console.log('medium');
            } else {
              console.log('medium off');
            }
            break;
        case "screen and (min-width: 480px)":
            if(mql.matches){ 
              console.log('small');
            } else {
              console.log('small off');
            }
            break;
        default:     
      }
    },
    addEventListeners : function(){
      for (var i=0; i<this.options.query.length; i++){
        this.handleQuery(this.options.query[i]);
        this.options.query[i].addListener(this.handleQuery);
      }

    },
    removeEventListeners : function(){

    },
    init : function() {
      this.addEventListeners();
      this.handleQuery(this.mm);
      index++;
    }
  };

  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName,
        plugins.push(new Plugin( this, options )));
      }
    });
  };

  function init(){
    $(defaults.el)[pluginName]();
  }
  init();  

}