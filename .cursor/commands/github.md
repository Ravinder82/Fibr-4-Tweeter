command named "Github" that executes the complete Git workflow to push changes to the main branch.
**Command Functionality:**
- Add all modified, new, and deleted files to staging area (`git add .`)
- Commit changes with appropriate commit message
- Push commits to the main branch of the remote repository
**Required Parameters:**
- Commit message (required)
- Repository path (if not current directory)
**Command Execution Steps:**
1. Navigate to specified repository directory
2. Stage all changes using `git add .`
3. Create commit with provided message using `git commit -m "[message]"`
4. Push to main branch using `git push origin main`
**Error Handling:**
- Verify repository exists and is a valid Git repository
- Check for merge conflicts before pushing
- Confirm main branch exists as target
- Provide clear error messages for failed operations
**Usage Example:**
`Github "Updated user authentication module"`***