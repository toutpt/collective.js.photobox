from zope import interface
from zope import schema

loop_desc = u"Loop back to last image before the first one and to the first\
image after last one."
thumb_desc = u"Show thumbs of all the images in the gallery at the bottom"
counter_desc = u"Show the current image index position relative to the whole."
hideFlash_desc = u"Hide flash instances when viewing an image in the gallery"
keys_close_desc = u"Key codes which close the gallery."
keys_prev_desc = u"Key codes which change to the previous image."
keys_next_desc = u"Key codes which change to the next image."


class PhotoboxSettings(interface.Interface):
    """expose settings schema"""
    loop = schema.Bool(title=u"Loop", default=True)
    thumbs = schema.Bool(title=u"Thumb", default=True)
    counter = schema.Bool(title=u"Counter", default=True)
    hideFlash = schema.Bool(title=u"Hide Flash", default=True)
    keys_close = schema.ASCIILine(title=u"Close key", default="27, 88, 67")
    keys_prev = schema.ASCIILine(title=u"Previous key", default="37, 80")
    keys_next = schema.ASCIILine(title=u"Next key", default="39, 78")
