import Query from "rql/src/query";

function isTermsQuery(vocabulary) {
  return Array.isArray(vocabulary.terms) && vocabulary.terms.length > 0;
}

function isNumericQuery(vocabulary) {
  return !Array.isArray(vocabulary.terms) && (vocabulary.attributes || []).filter(attribute => attribute.key === "type" && ["integer", "decimal"].indexOf(attribute.value) > -1).length === 1;
}

function isMatchQuery(vocabulary) {
  return !Array.isArray(vocabulary.terms) && (vocabulary.attributes || []).filter(attribute => (attribute.key === "localized" && "true" === attribute.value) || (attribute.key === "type" && attribute.value === "string")).length > 0;
}

function stringIsNullOrEmpty(str) {
  if (str === null || str === undefined) return true;
  if (typeof str === "string") return str.trim().length === 0;
  else return false;
}

export default class Criterion {

  vocabulary = undefined;
  type = undefined;

  value = undefined;
  _operator = undefined;

  static typeOfVocabulary(vocabulary) {
    let type = undefined;

    if (isTermsQuery(vocabulary)) {
      type = "TERMS";
    } else if (isNumericQuery(vocabulary)) {
      type = "NUMERIC";
    } else if(isMatchQuery(vocabulary)) {
      type = "MATCH";
    }

    return type;
  }

  static associatedQuery(vocabulary, inputs) {
    let type = Criterion.typeOfVocabulary(vocabulary);
      
    return (inputs || []).filter(input => {
      let found = false;

      switch(type) {
        case "TERMS":
        case "NUMERIC":
            found = input.args[0].indexOf(vocabulary.name) > -1;
          
          break;
        case "MATCH":
          found = input.operator === "match" && input.args[1].indexOf(vocabulary.name) > -1;

          break;    
      }

      return found;
    })[0];
  }

  static splitQuery(query) {
    let output = [];

    if (query) {        
      query.walk((name, args) => output.push({operator: name, args}));
    }

    return output;
  }
  
  constructor(vocabulary) {
    this.vocabulary = vocabulary;

    if (isTermsQuery(this.vocabulary)) {
      this.operator = "in";
      this.value = [];
    } else if (isNumericQuery(this.vocabulary)) {
      this.operator = "between";
      this.value = [];
    } else {
      this.operator = "match";
      this.value = null;
    }

    this.type = Criterion.typeOfVocabulary(vocabulary);
  }

  get operator() {
    return this._operator;
  }

  set operator(value) {
    this._operator - value;

    switch(this.type) {
      case "TERMS":
        if (["missing", "exists"].indexOf(this.operator) > -1) {
          this.value = [...this.terms];
        } 

        break;
      case "NUMERIC":
        if (["missing", "exists"].indexOf(this.operator) > -1) {
          this.value = ["*", "*"];
        }

        break;
      default:
        if (["missing", "exists"].indexOf(this.operator) > -1) {
          this.value = "*";
        }

        break;  
    }
  }

  get terms() {
    if (this.type === "TERMS") {
      return (this.vocabulary.terms || []).map(term => term.name);
    }

    return null;
  }

  set query(input) {
    this._operator = input.operator;

    switch(this.type) {
      case "TERMS":
        if (["missing", "exists"].indexOf(this.operator) > -1) {
          this.value = [...this.terms];
        } else {
          this.value = Array.isArray(input.args[1]) ? input.args[1] : [input.args[1]];
        }

        break;
      case "NUMERIC":
        if (this.operator === "ge" || this.operator === "le") {
          this.value = [input.args[1]];
        } else if (input.operator === "between") {
          this.value = [input.args[1][0], input.args[1][1]];
        }

        break;
      default:
        this.value = input.args[0];

        break;  
    }
  }

  asQuery(taxonomy) {
    let query = new Query(this.operator);

    switch(this.type) {
      case "TERMS":
        query.push(`${taxonomy}.${this.vocabulary.name}`);

        if (this.terms.length === this.value.length) {
          query.name = "exists";
        } else {
          query.name = "in";
        }

        if (["missing", "exists"].indexOf(query.name) === -1 || this.terms.length < this.value.length) {
          query.push(this.value);
        }      
        
        break;
      case "NUMERIC":
        query.push(`${taxonomy}.${this.vocabulary.name}`);

        if (["missing", "exists"].indexOf(this.operator) > -1) {
          this.value = ["*", "*"];
        } else {
          if (stringIsNullOrEmpty(this.value[0]) && stringIsNullOrEmpty(this.value[1])) {
            this.value = [];
          } else if (!stringIsNullOrEmpty(this.value[0]) && stringIsNullOrEmpty(this.value[1])) {
            query.name = "ge";
            this.value = [this.value[0]];
          } else if (stringIsNullOrEmpty(this.value[0]) && !stringIsNullOrEmpty(this.value[1])) {
            query.name = "le";
            this.value = [this.value[1]];
          } else if (!stringIsNullOrEmpty(this.value[0]) && !stringIsNullOrEmpty(this.value[1])) {
            query.name = "between";
          }
        }        

        query.push(this.value);

        break;
      default: 
        if (stringIsNullOrEmpty(this.value)) {
          query.push("");
        } else {
          query.push(this.value);
        }
        
        query.push(`${taxonomy}.${this.vocabulary.name}`);        

        break;  
    }

    return query;
  }

  findTerm(termName) {
    const found = this.vocabulary.terms.filter(term => term.name === termName);
    return found.length > 0 ? found[0] : undefined;
  }

  toString() {
    if (["missing", "exists"].indexOf(this.operator) > -1) {
      const title = this.vocabulary.title[0].text;
      const text = this.operator === "missing" ? "none" : "any";
      return `${title}:${text}`;
    }

    if (this.type === "TERMS") {
      if ((this.value || []).length > 5) return `${this.vocabulary.title[0].text}:...`;

      const text = (this.value || []).map(val => {
        const term = this.findTerm(val);
        return term ? term.title[0].text : val;
      }).join(" | ");

      return `${text}`;
    } else if (this.type === "NUMERIC") {
      let text = ""

      if (!stringIsNullOrEmpty(this.value[0]) && stringIsNullOrEmpty(this.value[1])) {
        text = `:>${this.value[0]}`;
      } else if (stringIsNullOrEmpty(this.value[0]) && !stringIsNullOrEmpty(this.value[1])) {
        text = `:<${this.value[1]}`;
      } else if (!stringIsNullOrEmpty(this.value[0]) && !stringIsNullOrEmpty(this.value[1])) {
        text = `:[${this.value[0]},${this.value[1]}]`;
      }

      return `${this.vocabulary.title[0].text}${text}`;
    } else {
      let text = "";
      if (!stringIsNullOrEmpty(this.value)) {
        text = `:match(${this.value})`;
      }
      return `${this.vocabulary.title[0].text}${text}`;
    }
  }
}