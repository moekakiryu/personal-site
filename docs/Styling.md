# Styling

## Guidelines

For every rule there is an exception. The below should be helpful in guiding CSS
development, but should not be treated as absolute truth.

If there is a compelling reason to deviate from these, please think twice, then
deviate anyway.

1. **Scope CSS to components**

    Every component should have a unique class associated with it. 
    
    Sub-classes may have non-unique names, however should always be styled as
    descendants of the main component class.

    ```scss
    /* Yes */
    .component {/* ... */}

    .component .title {/* ... */}

    .component .description {/* ... */}
    
    /* (0r) */

    .component {
        /* ... */ 

        .title {/* ... */}

        .description {/* ... */}
    }


    /* No */
    .component {/* ... */}

    .title {/* ... */}

    /* Maybe - but very verbose */
    .component-description {/* ... */}
    ```

2. **Prefer flex and grid**

    Flex and grid have nearly universal support and are excellent for defining
    page layouts. Prefer using these instead of more traditional layout methods.

    ```scss
    /* Yes */
    .example {
        display: flex;
        align-items: center;
    }

    /* No */
    .example .child {
        margin: 0 auto;
    }
    ```

3. **Only use min-width for media queries**

    This helps enforce a strict mobile-first design. This also keeps one set of
    declarations per breakpoint, albeit at the cost of occasionally needing to
    clear mobile styles.

4. **Avoid 'external' spacing when building components**

    Avoid the following pattern:

    ```scss
    .container {
        // Or any value
        margin-top: 1rem;
    }
    ```

    Using this pattern is useful to ensure components can be used as drop-ins on
    a page but quickly complicate things if spacing needs to be different from
    page to page. Instead of using this, let each consuming container decide how
    far apart each container should be using `padding` and `gap`.

5. **Put container definitions in the child**

    Children often have more styles than containers, and are the heart of any
    component. Rather than putting the container at the top level of a file,
    nest it inside the child definition.

    This also keeps things DRY by only listing the component name once.

    ```scss
    /* Yes */
    .example {
        // Component-specific styles
        @at-root {
            &-container {
                // Container styles
            }
        }
    }

    /* No */
    .example-container {
        // Container styles

        .example {
            // Component-specific styles
        }
    }
    ```

6. **Parent containers define horizontal spacing, children define vertical spacing**

    ```scss
    /* Yes */
    .container {
        padding: 0 1rem;

        .child {
            padding: 1rem 0;

        }
    }

    ```


## Breakpoints


| **Breakpoint** | **Value** |
|----------------|-----------|
| Mobile         | [Default] |
| Tablet         | >= 480px  |
| Desktop        | >= 768px  |
| Large          | >= 1920px |