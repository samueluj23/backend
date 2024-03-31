"use strict";
var validator = require('validator');


exports.checkValidation = (data) => {

    let errors = [];

    if (data) {

        for (var [key, value] of Object.entries(data)) {
            if(typeof(value) == "string"){
                value = validator.trim(value);
                value = validator.escape(value);

                if (validator.isEmpty(value)) {
                    errors.push(`Invalid Input Data for ${key}`);
                }
            }  
        }

        if (errors.length) {
            return { success: false, msg: 'Fields are missing', data: data, errors: errors.join(',') };
        } else {
            return { success: true, msg: 'Fields are valid', data: data, errors: "" };
        }
    } else {
        return { success: false, msg: 'Fields are missing', data: data, errors: 'Fields are missing' };
    }


}

exports.varifyValue = (item)=>{
    if(item != null && item != undefined && item != ''){
        return true;
    }else{
        return false;
    }
}

exports.updateProfileValidation = (data) => {

    let errors = [];

    if (data) {

        for (var [key, value] of Object.entries(data)) {
            value = value[0]
            if(typeof(value) == "string"){
                
                value = validator.trim(value);
                value = validator.escape(value);

                if (validator.isEmpty(value)) {
                    errors.push('Invalid Input Data');
                }
            } 
        }

        if (errors.length) {
            return { success: false, msg: 'Fields are missing', data: data, errors: errors.join(',') };
        } else {
            return { success: true, msg: 'Fields are valid', data: data, errors: errors.join(',') };
        }
    } else {
        return { success: false, msg: 'Fields are missing', data: data, errors: 'Fields are missing' };
    }


}

const identicalEmail = (email) => {
    let email1 = email.split("@")
    let myArray = email1[email1.length-1].split(".")
    for (var i = 0; i < myArray.length; i++)
    {
        for (var j = 0; j < myArray.length; j++)
        {
            if (i !== j)
            {
                if (myArray[i] === myArray[j])
                {
                    return true; // means there are duplicate values
                }
            }
        }
    }
    return false; // means there are no duplicate values.
}

exports.emailVerification = (value) => {
    if(typeof(value) == "string"){
        let field = validator.trim(value);
        field = validator.escape(value);
        if (field != null && field != undefined && field != '') {
            let emailIDVal = /^(?!.{255})(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            let emailIDTrue = emailIDVal.test(field);
            if(emailIDTrue && field.length < 256){
                const isDuplicateKey = identicalEmail(field);
                if(!isDuplicateKey){
                    return true;
                }else{
                    return false
                }
            }else{
                return false
            }
        } else {
            return false
        }
    }else {
        return false
    }   
}

exports.fullNameVerification = (value) =>{
    if(typeof(value) == "string"){
        let field = validator.trim(value);
        field = validator.escape(value);
        if (field != null && field != undefined && field != '') {
            const userNameVal = /^[a-zA-Z ]{1,256}$/;
            const isValidName = userNameVal.test(field);
            if(isValidName){
                return true;
            }else{
                return false
            }
        }else{
            return false
        }
    }else {
        return false
    }   
}

exports.passWordVerification = (value) => {
    if(typeof(value) == "string"){
        const field = validator.trim(value);
        if (field != null && field != undefined && field != '') {
            let passValTrue = /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d@#$^!%*?&_]{6,}$/;
            const isValidPass = passValTrue.test(field);
            if(isValidPass){
                return true; 
            }else{
                return false;
            }
        }else{
            return false;
        }
    }else {
        return false
    }   
}

exports.charVerification =(value) => {
    if(typeof(value) == "string"){
        let field = validator.trim(value);
        field = validator.escape(value);
        if (field != null && field != undefined && field != '') {
            const valRegex =  /^[a-zA-Z ]*$/;
            const isValidString = valRegex.test(field);
            if(isValidString){
                return true;
            }else{
                return false
            }
        }else{
            return false;
        }
    }else {
        return false
    }
}

exports.varCharVerification = (value) =>{
    if(typeof(value) == "string"){
        let field = validator.trim(value);
        field = validator.escape(value);
        if (field != null && field != undefined && field != '') {
            const valRegex = /^[a-zA-Z0-9 ]*$/;
            const isValidString = valRegex.test(field);
            if(isValidString){
                return true;
            }else{
                return false
            }
        }else{
            return false;
        }
    }else {
        return false
    }
}

