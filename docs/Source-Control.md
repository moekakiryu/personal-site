# Source Control

## Branching Strategy

1. Always branch from `master`

    ```sh
    git checkout master
    git checkout -b feature/<feature branch>
    ```

2. Once finished, merge into `develop`

    ```sh
    git checkout develop
    git merge feature/<feature branch>
    ```

3. To deploy, push `develop` to `deploy/master`
    
    ```sh
    git push deploy develop:master
    ```

    *This will allow us to rollback to local `master` in the event of a critical
    deployment issue*

4. After a successful deployment, merge `develop` into `master`

    ```sh
    git checkout master
    git merge develop
    ```

5. Delete any feature branches included in the latest deployment

    ```sh
    # (still on master)
    git branch -d feature/<feature branch>
    ```

    *Always use lowercase 'd' to delete branches. Using this branching strategy 
    means that git will raise an error if we accidentally try to delete an
    undeployed branch.*