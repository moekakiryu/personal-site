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

    ```css
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


## Breakpoints


| **Breakpoint** | **Value** |
|----------------|-----------|
| Mobile         | [Default] |
| Tablet         | >= 480px  |
| Desktop        | >= 768px  |
| Large          | >= 1920px |