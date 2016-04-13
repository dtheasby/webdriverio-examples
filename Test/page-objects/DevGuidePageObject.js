var DevGuide = (function() {
    
  function DevGuide() {
    this.testRunnerElement = '[data-open="testrunner"]';
    this.testRunnerDropdown = ".commands.testrunner";
    
};

DevGuide.prototype.getElementId = function(ele) {
    return ele.value.ELEMENT;   
};

DevGuide.prototype.numberOfSubElements = function(ID) {
   return browser.elementIdElements(ID,'<a>').then(function(elementsArray){
        return Object.keys(elementsArray.value).length;
    });
};

return DevGuide;
})();

module.exports = DevGuide;
