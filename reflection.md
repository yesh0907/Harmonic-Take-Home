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
- I had a hard time figuring out how to get all the selected rows from the table across different pages, so the user is limited to selecting as many items on the page at one time
- I worked on this assignment during a 16 hour train ride with limited internet access, I was very limited on the tools I could use to help me, so a lot of UI elements were made using a naive HTML approach


## Next steps
- Fixing bugs:
    - allow the user can select multiple items across pages
    - keep the task id in local storage until it is done
    - prevent the scroll of table from being reset every paginated request
- Instead of polling, use server side events or websockets to get updates on the task's status
- Use the MUI List component or an autocomplete to select which list to copy data to
- I cut a lot of corners to only support the "happy path", I would love to stress