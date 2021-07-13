# Air-react-forms

A react-based library that helps you create controlled forms using hooks.

* [Getting started](#getting-started)
* [Usage examples](#usage-examples)
  * [Field validation](#using-field-validation)
  * [Displaying validation error messages](#displaying-validation-error-messages)
  * [Accessing the form's data](#accessing-the-forms-data)
  * [Toggle fields on and off](#toggle-fields-on-and-off)
  * [Using dynamic field arrays](#Using-dynamic-field-arrays)
  * [Using checkbox groups](#Using-checkbox-groups)
  * [Using radio button groups](#Using-radio-button-groups)
* [API reference](#api-reference)

--- 

## Getting started
We have a lot of examples on how to use the various features in the dedicated [wiki section](LINK-TO-WIKI-SECTION), but here's the most bare use of the library :
```js
import { useForm, FormProvider } from 'air-react-forms';

const basicForm = () => {
  const { formContext, handleSubmit, register } = useForm();
  const myInputFieldData = { id: 'firstname', name: 'firstname', defaultValue: 'John' };

  return (
    <FormProvider context={formContext}>
      <form onSubmit={handleSubmit(console.log)}>
        <>
          <label htmlFor="firstname">Firstname</label>
          <input id="firstname" {...register(myInputFieldData)} />
        </>
        <input type="submit">Submit</input>
      </form>
    </FormProvider>
  )
};
```

---

## Usage examples

These are only examples of what you can do with this library, but be aware that some features or use cases are not covered here. We advise you to take a look to the [in depth documentation](LINK-TO-IN-DEPTH-DOC-WIKI-PAGE) for more details about the code.

### Using field validation
Field validation is made possible by providing a `rules` object to the `register` method, in the following format : 
```js
rules: {
	rule_key: validationCallbackMethod
}
```

Let's say I want to make my `firstname` field required, I can do it like this :

```js
import { FormProvider, useForm } from 'air-react-forms';

// My validation callback.
const validationMethod = (value) => (value.trim().length === 0 ? 'error' : '');

// My form component
const validatedForm = () => {
  const { formContext, handleSubmit, register } = useForm();
  const myInputFieldData = {
    id: 'firstname',
    name: 'firstname',
    defaultalue: 'John',
    rules: { required: validationMethod }
  };

  return (
    <FormProvider context={formContext}>
      <form onSubmit={handleSubmit(console.log)}>
        <>
          <label htmlFor="firstname">Firstname</label>
          <input id="firstname" {...register(myInputFieldData)} />
        </>
        <input type="submit">Submit</input>
      </form>
    </FormProvider>
  )
};
```

With this little addition to our component, users won't be able to submit the form until the *firstname* input passes the validation check.

> <u>Note:</u> We provide a number of premade **validation methods** which you can learn more about in the [dedicated section](LINK-TO-VALIDATORS-DOC).

<br />

### Displaying validation error messages
Now that we made sure our form can't be submitted until the *firstname* input has been filled, we may want to explain to our users **why** the form won't submit. Luckily, the `useForm` hook provides a `formState` object, which contains the validation error messages from the latest checks :

Let's say I want to make my `firstname` field required, I can do it like this :

```js
import { FormProvider, useForm } from 'air-react-forms';

// My validation callback.
const validationMethod = (value) => (value.trim().length === 0 ? 'error' : '');

// My form component
const validatedForm = () => {
  const { formContext, formState: { errors }, handleSubmit, register } = useForm();
  const myInputFieldData = {
    id: 'firstname',
    name: 'firstname',
    defaultalue: 'John',
    rules: { required: validationMethod }
  };

  return (
    <FormProvider context={formContext}>
      <form onSubmit={handleSubmit(console.log)}>
        <>
          <label htmlFor="firstname">Firstname</label>
          <input id="firstname" {...register(myInputFieldData)} />
          {errors.firstname?.required && <span>{errors.firstname.required}</span>}
        </>
        <input type="submit">Submit</input>
      </form>
    </FormProvider>
  )
};
```

Now, whenever our users ✨ forget ✨ to fill the **only field in the form**, they will be prompted the error message we defined in our validation method callback.


<br />

### Accessing the form's data
Until now, we've only used a blatantly useless `console.log` method as our form's onSubmit. Let's take a better look at how to use the `handleSubmit` method.

The `handleSubmit` method takes a callback value parameter, which will be called after a complete form validation has been made and no error has been generated. The callback method parameter will receive the form's data in the following format :

```js
{
  input_name: inputValue,
  firstname: 'john',
  lastname: 'doe',
  age: 21,
  favoriteColor: 'green',
  ...
}
```

> <u>Note:</u> Values of field arrays and checkbox groups will be detailed in their specific sections.

Let's get back to our trusty basic form component and update it so that it displays the value of its fields in a JSON format on submit : 


```js
import { useState } from 'react';
import { FormProvider, useForm, Validators } from 'air-react-forms';

const myForm = () => {
  const { formContext, formState: { errors }, handleSubmit, register } = useForm();
  const [formData, setFormData] = useState({});

  const myInputFieldData = {
    id: 'firstname',
    name: 'firstname',
    defaultalue: 'John',
    rules: { required: Validators.isRequired('please provide a firstname') },
  };

  return (
    <FormProvider context={formContext}>
      <form onSubmit={handleSubmit(setFormData)}>
        <>
          <label htmlFor="firstname">Firstname</label>
          <input id="firstname" {...register(myInputFieldData)} />
          {errors.firstname?.required && <span>{errors.firstname.required}</span>}
        </>
        <input type="submit">Submit</input>
      </form>

      <h3>Form data</h3>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </FormProvider>
  )
};
```

<br />

### Toggle fields on and off

It is rather common to have fields displayed conditionnaly inside our forms, and this feature has not been forgotten: the field will be registered normally as soon as it enters the DOM, and removed from the field reference list as soon as it disappears (which means it won't trigger any validation errors if not displayed).

```js
import { useState } from 'react';
import { FormProvider, useForm, Validators } from 'air-react-forms';

const myForm = () => {
  const { formContext, formState: { errors }, handleSubmit, register } = useForm();
  const [toggleFieldDisplay, setToggleFieldDisplay] = useState(false);

  const myInputFieldData = {
    id: 'firstname',
    name: 'firstname',
    defaultalue: 'John',
    rules: { required: Validators.isRequired('please provide a firstname') },
  };

  return (
    <FormProvider context={formContext}>
      <form onSubmit={handleSubmit(console.log)}>
        {toggle && (
          <>
            <label htmlFor="firstname">Firstname</label>
            <input {...register(myInputFieldData)} />
            {errors.firstname?.required && <span>{errors.firstname.required}</span>}
          </>
        )}
        <button type="button" onClick={() => setToggleFieldDisplay(!toggleFieldDisplay)}>toggle</button>
        <input type="submit">Submit</input>
      </form>
    </FormProvider>
  )
};
```

<br />


### Using dynamic field arrays

Sometimes, you may need to let users control the amount of inputs available (for instance, a registration form that lets users provide as many phone numbers as they want). You can achieve this by using the `useFieldArray` hook paired with `useForm` : 

```js
import { FormProvider, useFieldArray, useForm, Validators } from 'air-react-forms';

const myForm = () => {
  const { formContext, formState: { errors }, handleSubmit } = useForm();

  const { append, fields, register, remove } = useFieldArray({
    name: 'phoneNumbers',
    rules: { required: Validators.isRequired('please provide a phone number.') },
  }, formContext);

  return (
    <FormProvider context={formContext}>
      <form onSubmit={handleSubmit(console.log)}>
        <fieldset>
          <legend>Phone numbers</legend>

          {fields.map((field) => (
            <Fragment key={field.id}>
              <label htmlFor={field.id}>{field.name}</label>
              <div style={{ display: 'flex' }}>
                <input {...register(field)} />
                <button type="button" onClick={() => remove(field)}>remove</button>
              </div>
              {errors.phoneNumbers?.[field.name]?.required && <span>{errors.phoneNumbers?.[field.name]?.required}</span>}
            </Fragment>
          ))}

          <button type="button" onClick={append}>Add field</button>
        </fieldset>

        <input type="submit">Submit</input>
      </form>
    </FormProvider>
  )
};
```

The result forwarded to your submit callback method will have the following shape :

```js
{
  fieldArrayName: [
    fieldArrayInput1Value,
    fieldArrayInput2Value,
    ...,
  ],
  phoneNumbers: [
    '0123456789',
    '1234567890',
    ...
  ]
}
```

### Using checkbox groups
You can absolutely use checkbox-typed inputs with different names and treat them as a regular "standalone" field (using `useForm`'s `register` method as you would with a regular input), but there may be times when you need to have a group of checkboxes related to each other.

For instance, imagine you're building a form for a fast food delivery app, where users can choose which toppings they want on their pizzas, and you want to limit the amount to toppings to 4 maximum, you can use the `useCheckboxGroup` hook to achieve just that : 

```js
import { FormProvider, useCheckboxGroup, useForm, Validators } from 'air-react-forms';

const myForm = () => {
  const { formContext, formState: { errors }, handleSubmit } = useForm();

  const { register: registerCheckbox } = useCheckboxGroup({
    name: 'toppings',
    rules: {
      maxChecked: Validators.hasMaxChecked(3, 'You can only select up to 3 toppings'),
    },
  }, formContext);

  return (
    <FormProvider context={formContext}>
      <form onSubmit={handleSubmit(console.log)}>
        <fieldset>
          <legend>Toppings</legend>
          <div>
            <label htmlFor="toppings-pepperoni">Pepperoni</label>
            <input {...registerCheckbox({ value: 'pepperoni' })} />
          </div>
          <div>
            <label htmlFor="toppings-mushrooms">Mushrooms</label>
            <input {...registerCheckbox({ value: 'mushrooms' })} />
          </div>
          <div>
            <label htmlFor="toppings-jalapeños">Jalapeños</label>
            <input {...registerCheckbox({ value: 'jalapeños' })} />
          </div>
          <div>
            <label htmlFor="toppings-olives">Olives</label>
            <input {...registerCheckbox({ value: 'olives' })} />
          </div>
          {errors.toppings?.maxChecked && <span>{errors.toppings?.maxChecked}</span>}
        </fieldset>

        <input type="submit">Submit</input>
      </form>
    </FormProvider>
  )
};
```

> <u>Note:</u> Validation rules provided to the `useCheckboxGroup` hook are applied to the group **as a whole**, not on each checkbox individually.

The result forwarded to your submit callback method will have the following shape
```js
{
  checkboxGroupName: {
    first_checkbox_value: true|false,
    second_checkbox_value: true|false,
    ...,
  },
  toppings: {
    pepperoni: false,
    mushrooms: true,
    jalapeños: true,
    olives: true,
  }
}
```

---

### Using radio button groups
To use radio buttons, you can use the `useRadioButtonGroup` hook, which allows you to apply validation on radio buttons as a group. Here's an example of how to achieve that :

```js
import { FormProvider, useRadioButtonGroup, useForm, Validators } from 'air-react-forms';

const myForm = () => {
  const { formContext, formState: { errors }, handleSubmit } = useForm();

  const { register } = useRadioButtonGroup({
    name: 'deliveryMethod',
    rules: {
      required: Validators.rdbGroupIsRequired('Please select a delivery method'),
    },
  }, formContext);

  return (
    <FormProvider context={formContext}>
      <form onSubmit={handleSubmit(console.log)}>
        <fieldset>
          <legend>Delivery method</legend>
          <div>
            <label htmlFor="deliveryMethod-delivery">Delivery</label>
            <input {...register({ value: 'delivery' })} />
          </div>
          <div>
            <label htmlFor="deliveryMethod-takeout">Take out</label>
            <input {...register({ value: 'takeout' })} />
          </div>
          {errors.deliveryMethod?.required && <span>{errors.deliveryMethod?.required}</span>}
        </fieldset>

        <input type="submit">Submit</input>
      </form>
    </FormProvider>
  )
};
```

---

## API Reference

This part is still in progress.