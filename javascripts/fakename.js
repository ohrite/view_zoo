var fakeName = (function(){
  var surnames = [
    "Jed", "Rob", "Haggar", "Moon", "Leigh", "Paul", "Rowan", "Stephan",
    "Jordan", "Michael", "Thomas", "Michelle", "Kris", "Itchy"
  ];

  var families = [
    "Braun", "Hammer", "Honda", "Michaels", "Robson", "Krupp", "Stevens",
    "Laporte", "Simonoff", "Rainbow", "Karimov"
  ];
  
  function hash(parameter)
  {
  	var result = 5381;
  	
  	for (var i = 0, c; parameter[i] && (c = parameter.charCodeAt(i)); i++) {
  	  hash = ((hash << 5) + hash) + c;
  	}
  	
  	return hash;
  }

  return function(parameter) {
    var surname, family;
    
    if (parameter) {
      var seed = hash(parameter);
      surname = seed % surnames.length;
      family = seed % families.length;
    } else {
      surname = Math.floor(Math.random() * surnames.length);
      family = Math.floor(Math.random() * families.length);
    }
    
    return { first_name: surnames[surname], last_name: families[family] };
  }
})();
