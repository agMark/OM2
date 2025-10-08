
# Owner's Manual Environment

The Repository is for editing the Air Tractor Owner's Manuals in html/xml format.

Please contact Mark for access to modify the files in this repository.



## What is this anyways?

Historically, these documents have been written and maintained in normal word processors like MSWord and WordPerfect.

These documents are getting too large and need to be better organized which makes maintenance with MSWord, very difficult or impossible.

Organizing all the content into HTML files allows for easier editing of individual sections.

The document is compiled from the HTML files into a single page that is then rendered for print using the Paged.js javscript library.

DocDef.js is the javascript script that links and orders all of the individual sections into a single document.

## Styles

Inline styling of elements needs to be limited in the HTML files or it will be difficult to maintain.  Generally, all the styling should be in elementStyling.css which is in the css folder.

Certain Paged.js related styles relating to pagination and headers and things like that are in pagedjs.css and should not be modified.

## Rules of Thumb

The html files should be as small as practical.  A single paragraph is perfectly acceptable.
The overarching idea is that these small files can eventually be organized and reused in other documents to avoid copying and pasting.


## Images

We need to standardize the shape and formatting of images that are in the document.

Currently acceptable shapes are:

    | Width(in) | Height(in)    |
    |-----------|---------------|
    | 6.0       | 8.0           |
    | 6.0       | 4.0           |
    | 3.0       | 2.0           |


## Caution and Warning Boxes

The standard caution and warning boxes are:

small: 3in wide x Content Height\
medium: 4.5in wide x Content Height\
large: 6in wide x Content Height

Each size has corresponding css classes that should be applied.

For a small box, html markup is as follows:
```html
<div class="boxCautionSmall">
    <p class="boxCautionSmallHeader">CAUTION</p>
    <p class="boxCautionSmallText">Caution's text goes here.</p>
</div>
```


## Tables
There is a lot of content that is formatted as tables.  Some are simple and can use standard style classes, others require column spanning and other complicated styles that will need to be done in the html elements.

The standard table styles are

plainTableLarge

The cells are styled as follows

```html
<table class="plainTableLarge">
    <tr>
        <th class=plainTableHeaderCell>Header Cell 1</th>
        <th class=plainTableHeaderCell>Header Cell 2</th>
    </tr>
    <tr>
        <td class="plainTableNormalCell centerText">Row 1 Cell 1</td>
        <td class="plainTableNormalCell centerText">Row 2 Cell 1</td>
    </tr>
</table>
```

## Cross References
Cross references to other sections should be made using xref elements.
The xref element should have attributes.

fileTarget: If note empty, fileTarget should indicate the html file name for the section that is desired to be linked.

sectionTarget: If not empty, section Target should indicate the section number (a string) to link to.

xrefType: options are link and text.  "link" will make a clickable link using an anchor element.

prependLabel: Text that you want before the cross reference number.  "Section" in a link that says "Section 2.1".

When processing, sectionTarget is prioritized over fileTarget.  One of the two must be specified.

```html
<p>See <xref fileTarget="Windshield Washer.html" xrefType="link", prependLabel="Section"></xref> for more information.</p>
```
will render like:

See Section 2.0.1 for more information.

With "Section 2.0.1" being the clickable link.


# Paged.js Notes
## Page Number Counters
Page number counters are finnicky.
To track individual section counters, it works best to declare a counter against the body in css:
```css
body{
    counter-reset: CounterName
}
```
Then use the header elements class to increment the counter.  
```css
.descriptionHeaderRight {
    counter-increment: CounterName;
}

.descriptionHeaderLeft {
    counter-increment: CounterName;
}
```
If you try to add a new custom counter that increments on @page, pagedjs has a runtime error.

## Table of Contents
The page number feature in the table of contents doesn't work as described in paged.js documentation.Actually it does but it doesn't work as one would hope.

Using the target-counter() css function can only use the built in "page" counter.  This means that custom named and declared counters for individual sections cannot be used.

To get around this, a javascript function has been written.  It is in TocPostProcess.js.  This file should be loaded by the main html file and be ready for use after the paged.js processing routine is finished.

To run, do this in the console or via some other method:

```js
tocPostProcess()
```
