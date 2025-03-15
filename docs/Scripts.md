# JS Scripts

## Guidelines

1. Build self-contained objects for each set of functionality

    ```js
    const MyModule = {
      foo: false,
      bar: 'value',

      get computedValue() {/* ... s*/}

      method() {/* ... */}
    }
    ```

2. Each module should have a singe entry point, called `mount()` that takes no arguments

    ```js
    const MyModule = {
      mount() {
        // Initialize MyModule here
      }
    }
    ```

3. If you need to access a DOM element, use a dedicated CSS class following the format `js-[name]`.
   Do not use existing CSS classes to target elements as this is likely to introduce flakiness.

    ```html
    <div class="centered card js-interactive-card">
      <!-- ... -->
    </div>
    ```

4. Store any js classes in a `classes` attribute at the top of a module.

    ```js
    const MyModule = {
      classes: {
        card: 'js-interactive-card'
      }

      method() {
        const element = document.getElementsByClassName(this.classes.card)
      }
    }
    ```

5. All functions should be pure and deterministic. 