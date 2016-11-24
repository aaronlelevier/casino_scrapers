let windowProxy = {
  changeLocation: function(url) {
    window.document.location = url;
  }
};

export default windowProxy;
