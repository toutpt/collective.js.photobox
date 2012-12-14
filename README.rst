Introduction
============

This addon register photobox_ into Plone

version: v1

About PhotoBox
==============

Photobox is a CSS3 Image Gallery JQuery Plugin.

benefits
--------

* Both the script & CSS are only 7k each (minified script, not gziped)
* Uses silky-smooth, hardware accelerated, CSS3 transitions and animations (for better performance)
* Pretty UI and easy UX
* CSS3 preloader, tailored-made. The only image you need is the arrow.png (soon even not that)
* Works also on IE9 and above, but clearly not as nice as in normal browsers
* Uses event-delegation on all thumbnails events

settings
--------

* loop: Loop back to last image before the first one and to the first image after last one. Default: 'true'
* thumbs Show thumbs of all the images in the gallery at the bottom. Default: 'true'
* counter: Show the current image index position relative to the whole. Example (3,11). Default: 'true'
* hideFlash: Hide flash instances when viewing an image in the gallery. Default: 'true'
* keys.close: Key codes which close the gallery. Default "27, 88, 67"
* keys.prev: Key codes which change to the previous image. Default "37, 80"
* keys.next: Key codes which change to the next image. Default "39, 78"

Example
=======

If you install the addon using the provided buildout you can open your browser
on the view @@example.collective.js.photobox

Integration
===========

This addon provide an zope interface providing schema of the configuration.

Credits
=======

Companies
---------

|makinacom|_

* `Planet Makina Corpus <http://www.makina-corpus.org>`_
* `Contact Makina Corpus <mailto:python@makina-corpus.org>`_


People
------

- JeanMichel FRANCOIS aka toutpt <toutpt@gmail.com>
- Mathieu Le Marec - Pasquet <kiorky@cryptelium.net> 
- Jean-Philippe Camguilhem <jp.camguilhem@gmail.com>
- Johannes Raggam <raggam-nl@adm.at>
- Giacomo Spettoli

.. |makinacom| image:: http://depot.makina-corpus.org/public/logo.gif
.. _makinacom:  http://www.makina-corpus.com
.. _flickr: http://www.flickr.com
.. _picasaweb: http://picasaweb.google.com
.. _jcarousel: http://sorgalla.com/jcarousel
.. _facebook: http://www.facebook.com
