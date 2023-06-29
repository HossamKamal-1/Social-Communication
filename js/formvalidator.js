class FormValidator {
  static #validationOptions = [
    {
      attribute: 'server-error',
      isValid: () => false,
      errorMessage: (input, label) => `${label.textContent} has already taken`,
    },
    {
      attribute: 'max-img-size',
      isValid: () => false,
      errorMessage: (input, label) =>
        `Invalid ${label.textContent}: max image size is 4mb`,
    },
    {
      attribute: 'invalid-image-type',
      isValid: () => false,
      errorMessage: (input, label) =>
        `Invalid ${label.textContent}: invalid image type`,
    },
    {
      attribute: 'pattern',
      isValid: (input) => {
        const regexPattern = new RegExp(input.pattern);
        if (
          input.classList.contains('signup-password') &&
          input.type === 'password' &&
          !input.hasAttribute('match')
        ) {
          this.#setPasswordStrength(input, regexPattern);
        }
        return regexPattern.test(input.value);
      },
      errorMessage: (input, label) => {
        let passwordErrorMsg = `${label.textContent} is weak`;
        if (input.type === 'password') {
          const passwordRegex = new RegExp(input.pattern);
          if (!passwordRegex.test(input.value)) {
            passwordErrorMsg = `${label.textContent} can't have spaces`;
          }
        }
        const typeMessages = {
          text: `${label.textContent} is invalid`,
          email: `${label.textContent} is not valid`,
          password: passwordErrorMsg,
        };
        return typeMessages[input.type];
      },
    },
    {
      attribute: 'minlength',
      isValid: (input) => input.value && input.value.length >= +input.minLength,
      errorMessage: (input, label) =>
        `${label.textContent} can't be less than ${input.minLength}`,
    },
    {
      attribute: 'custom-maxlength',
      isValid: (input) =>
        input.value &&
        input.value.length <= +input.getAttribute('custom-maxlength'),
      errorMessage: (input, label) =>
        `${label.textContent} can't be higher than ${input.getAttribute(
          'custom-maxlength'
        )}`,
    },
    {
      attribute: 'match',
      isValid: (input) => {
        const matchedPasswordField = document.querySelector(
          input.getAttribute('match')
        );
        return input.value && input.value === matchedPasswordField.value;
      },
      errorMessage: (input, label) =>
        `${label.textContent} must be identical to the password`,
    },
    {
      attribute: 'required',
      isValid: (input) => {
        if (input.type !== 'password') {
          return !!input.value.trim();
        } else {
          return !!input.value;
        }
      },
      errorMessage: (input, label) => `${label.textContent} is required`,
    },
  ];
  static #setPasswordStrength(input, regexPattern) {
    const score = this.#checkPasswordStrength(input);
    const passwordIndicator = document.querySelector('.strength-indicator');
    if (regexPattern.test(input.value)) {
      passwordIndicator.classList.remove('d-none');
      if (score === 1 || score === 0) {
        // fix score 0 weak if the length exceeded the max
        console.log('weak password');
        console.log(`password score ${score}`);
        passwordIndicator.classList.remove('medium');
        passwordIndicator.classList.remove('strong');
        passwordIndicator.classList.add('weak');
        return false;
      } else if (score === 3 || score === 2) {
        console.log('medium password');
        passwordIndicator.classList.remove('strong');
        passwordIndicator.classList.remove('weak');
        passwordIndicator.classList.add('medium');
        console.log(`password score ${score}`);
        return true;
      } else {
        passwordIndicator.classList.remove('medium');
        passwordIndicator.classList.remove('weak');
        passwordIndicator.classList.add('strong');
        console.log('strong password');
        console.log(`password score ${score}`);
        return true;
      }
    } else {
      passwordIndicator.classList.add('d-none');
    }
  }
  static validateForm(
    formSelector,
    afterValidationCallback,
    formType = 'register',
    afterInputFileValidationCallback
  ) {
    const formElement = document.querySelector(formSelector);
    // Disabling HTML5 Validation
    formElement.setAttribute('novalidate', '');
    formElement.addEventListener('submit', (e) => {
      // Prevent Form From submitting
      e.preventDefault();
      const validationList = this.#validateAllFormGroups(formElement);
      if (
        validationList.every(({ isValidFormGroup: validState }) => validState)
      ) {
        console.log(validationList);
        console.log('total form is valid ');

        if (formType === 'register') {
          console.log('validation list');
          console.log(validationList);

          // const inputElementsObj = validationList.reduce((acc, current) => {
          //   if (current.input.id === 'passwordConfirmInput') {
          //     return acc;
          //   }
          //   return { ...acc, [current.input.id]: current.input };
          // }, {});
          const formData = new FormData(formElement);
          validationList.forEach(({ input }) => {
            if (input.type === 'file') {
              if (input.files.length) {
                formData.set(
                  'image',
                  formData.get('image'),
                  'profileimage.png'
                );
              } else {
                formData.delete('image');
              }
            }
          });
          console.log('from validadtion', [...formData]);
          afterValidationCallback(formData);
        } else {
          const inputValues = validationList.map(({ input }) =>
            input.value.trimEnd()
          );
          afterValidationCallback(...inputValues);
        }
        // sending the information to the api
      }
    });
    this.#addInputsEventListeners(
      formElement,
      afterInputFileValidationCallback
    );
  }
  static #addInputsEventListeners(formElement, inputFileCallback) {
    const inputs = formElement.querySelectorAll(
      'input:not([type=button]), select, textarea'
    );
    inputs.forEach((input) => {
      if (input.type !== 'file') {
        input.addEventListener('input', (e) => {
          this.#validateSingleFormGroup(e.target.closest('.form-group'));
          input.removeAttribute('server-error');
        });
        input.addEventListener('blur', (e) => {
          this.#validateSingleFormGroup(e.target.closest('.form-group'));
          input.removeAttribute('server-error');
        });
      } else {
        input.addEventListener('change', (e) => {
          this.#validateInputFile(e, inputFileCallback);
          this.#validateSingleFormGroup(e.target.closest('.form-group'));
        });
      }
    });
  }
  static #validateAllFormGroups(formElement) {
    const formGroups = [...formElement.querySelectorAll('.form-group')];
    const validationList = formGroups.map((formGroup) =>
      this.#validateSingleFormGroup(formGroup)
    );
    return validationList;
  }
  static #validateInputFile(e, callback) {
    if (!e.target.files.length) return; // if the user selected an image and then choose another one and press cancel
    console.log('file list is not empty');
    const imageFile = e.target.files[0];
    const { type: imageType, size: imageSize } = imageFile;
    const acceptTypeList = ['image/jpg', 'image/png', 'image/jpeg'];
    if (!acceptTypeList.includes(imageType)) {
      console.log('invalid image type');
      e.target.setAttribute('invalid-image-type', '');
      return;
    }
    e.target.removeAttribute('invalid-image-type');
    if (imageSize / 10 ** 6 > 4) {
      // greater than 4mb
      e.target.setAttribute('max-img-size', '');
      console.log('file size is invalid');
      return;
    }
    e.target.removeAttribute('max-img-size');
    if (typeof callback === 'function') {
      callback(imageFile);
    }
  }
  static #checkPasswordStrength(passwordInputField) {
    // Define regular expressions for password requirements
    const uppercaseRegex = /^(?=.*[A-Z])/;
    const lowercaseRegex = /^(?=.*[a-z])/;
    const digitRegex = /^(?=.*\d)/;
    const symbolRegex = /^(?=.*[@$!%*?&])/;
    const lengthRegex = new RegExp(
      `^.{${passwordInputField.minLength},${passwordInputField.getAttribute(
        'custom-maxlength'
      )}}$`
    );
    // Check if password meets each requirement
    const hasUppercase = uppercaseRegex.test(passwordInputField.value);
    const hasLowercase = lowercaseRegex.test(passwordInputField.value);
    const hasDigit = digitRegex.test(passwordInputField.value);
    const hasSymbol = symbolRegex.test(passwordInputField.value);
    const hasLength = lengthRegex.test(passwordInputField.value);

    // Calculate password strength score
    let score = 0;
    if (hasLength) {
      if (hasUppercase) score++;
      if (hasLowercase) score++;
      if (hasDigit) score++;
      if (hasSymbol) score++;
    }

    // Return password strength score
    return score;
  }
  static #validateSingleFormGroup(formGroup) {
    const label = formGroup.querySelector('label');
    const input = formGroup.querySelector('input,textarea');
    const errorEl = formGroup.querySelector('.error-msg');
    console.log(errorEl);
    const errorIcon = formGroup.querySelector('.error-icon');
    const successIcon = formGroup.querySelector('.success-icon');
    let isValidFormGroup = true;
    for (const validateOption of this.#validationOptions) {
      if (
        input.hasAttribute(validateOption.attribute) &&
        !validateOption.isValid(input)
      ) {
        if (errorEl) {
          errorEl.textContent = validateOption.errorMessage(input, label);
        }
        isValidFormGroup = false;
      }
    }
    input.classList.toggle('border-success', isValidFormGroup);
    input.classList.toggle('border-danger', !isValidFormGroup);
    if (errorEl) {
      errorEl.textContent = isValidFormGroup ? '' : errorEl.textContent;
    }
    if (errorIcon && successIcon) {
      errorIcon.classList.toggle('visually-hidden', isValidFormGroup);
      successIcon.classList.toggle('visually-hidden', !isValidFormGroup);
    }
    return { input, isValidFormGroup };
  }
}
export default FormValidator;
