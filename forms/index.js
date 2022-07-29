// import in caolan forms
const forms = require("forms");
const widgets = forms.widgets;
// create some shortcuts
const fields = forms.fields;
const validators = forms.validators;

const bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};


//this function will return an instance of the create prodcut form
const createProductForm = (categories, tags)=>{
    return forms.create({
        "name": fields.string({
            required: true,
            errorAfterField: true,
        }),
        'cost': fields.string({
            required: true,
            errorAfterField: true,
            validators: [validators.integer(), validators.min(0)]
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
        }),
        'category_id': fields.string({
            label:'Category',
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.select(),
            //choices: [[1001, "meat"], [1002,"veg"]]
            choices: categories
        }),
        'tags': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.multipleSelect(),
            choices:tags
        })
    })
}

const createUserForm = () => {
    return forms.create({
        'username': fields.string({
            required: true,
            errorAfterField: true,
        }),
        'email': fields.string({
            required: true,
            errorAfterField: true,
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true,
        }),
        'confirm_password': fields.password({
            required: true,
            errorAfterField: true,
            validators: [validators.matchField('password')]
        })
    })
}

const createLoginForm = () => {
    return forms.create({
        'email': fields.string({
            required: true,
            errorAfterField: true,
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true,
        }),
    })
}

module.exports = {createProductForm, bootstrapField, createUserForm, createLoginForm}