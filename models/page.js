var assert = require("assert");

var Page = function(args){

    assert.ok(args.url, "url is required");
    assert.ok(args.text, "text is required");

    this.url = args.url;
    this.title = args.title;
    this.text = args.text;
    this.saved = Date.now();

    return this;
};

module.exports = Page;