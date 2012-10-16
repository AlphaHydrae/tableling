# Tableling

Table plugin based on Backbone.Marionette. Check out the [demo](http://alphahydrae.github.com/tableling/demo/)!

**v0.0.9: Test suite not yet complete. Consider this very alpha.**

[![Build Status](https://secure.travis-ci.org/AlphaHydrae/tableling.png?branch=develop)](http://travis-ci.org/AlphaHydrae/tableling)

## About

Tableling leverages [Backbone](http://backbonejs.org) and [Backbone.Marionette](https://github.com/marionettejs/backbone.marionette) components to provide an extensible table that can be easily integrated into existing Marionette applications.

### Features

* Fetches table data from a `Backbone.Collection`
* Event-based management with a Marionette `EventAggregator`
* Provides view implementations using Marionette components (`Layout`, `CompositeView` and `ItemView`)
* Provides optional view markup with [Twitter Bootstrap](http://twitter.github.com/bootstrap/) classes
* Otherwise leaves the styling to you
* Modular structure allowing you to redefine each component separately:
  * Page size select box
  * Quick search field
  * Info notice (number of records)
  * Page switcher

## Requirements

Tableling currently works with the following libraries:

* [jQuery](http://jquery.com) v1.8.2
* [Underscore](http://underscorejs.org) v1.4.2
* [Backbone](http://backbonejs.org) v0.9.2
* [Backbone.EventBinder](https://github.com/marionettejs/backbone.eventbinder) v0.0.0
* [Backbone.Wreqr](https://github.com/marionettejs/backbone.wreqr) v0.0.0
* [Backbone.Marionette](http://marionettejs.com) v1.0.0-beta1

It may or may not work using different versions.

## Installation

You can find the raw source code in `src`. Development and production builds are in `lib`.

### Standard Build

* Development: [tableling.js](https://raw.github.com/AlphaHydrae/tableling/master/lib/tableling.js)
* Production: [tableling.min.js](https://raw.github.com/AlphaHydrae/tableling/master/lib/tableling.min.js)

### Backbone Build

Includes Backbone, Backbone.EventBinder, Backbone.Wreqr and Backbone.Marionette.

* Development: [tableling.backbone.js](https://raw.github.com/AlphaHydrae/tableling/master/lib/tableling.backbone.js)
* Production: [tableling.backbone.min.js](https://raw.github.com/AlphaHydrae/tableling/master/lib/tableling.backbone.min.js)

### Ruby on Rails

The [tableling-rails](https://github.com/AlphaHydrae/tableling-rails) gem provides the latest tableling release as well as active record extensions to easily generate table data in the expected format.

## Documentation

The [wiki](https://github.com/AlphaHydrae/tableling/wiki) provides the main documentation.

You can also read the [annotated source code](http://alphahydrae.github.com/tableling/annotated/).

## Meta

* **Author:** Simon Oulevay (Alpha Hydrae)
* **License:** MIT (see [LICENSE.txt](https://raw.github.com/AlphaHydrae/tableling/master/LICENSE.txt))
