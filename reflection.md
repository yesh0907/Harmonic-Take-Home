# Reflection
[loom walkthrough video](https://www.loom.com/share/685c9b58d90d44f793cd07dec9aae8ef?sid=2cc0f847-3c1c-46d2-8eaa-a2051b95dc25)

## My approach
- UI:
    - created a button to execute the desired action
        - to create a consistent UX, I created the button dynamically changes capability based on the currently selected items
    - use a modal to get the user's attention to choose which list
        - do not show the currently selected list to avoid confusion
    - use toasts to communicate event progress in a minimal and pleasant way
    - use a linear progress indicator to provide the user feedback on a bulk action
- FE state management:
    - I like to use a centralized state management approach (like a store)
    - I chose to go with React Context because I am familiar with its API and the project's scale is small
- BE API:
    - to handle individual new associations, I filter for any existing associations in the target list and then create the associations in batches of 1000
    - to handle copying all items from one list to another, I create a background task
        - the background task spawns a max of 5 threads and creates the associations in batches of 1000
        - the background task creates allows for the user to get a response asap, and the user can see the progress of the task
    - created an index on the company_id and collection_id to speed up reads

## Tradeoffs
- I wanted to create an MVP asap, so I avoided caching data

## Next steps