 + move home page controller out of app.js
 + split projects by lines of 3
 + login form and login / pw settings
 + auth for edit mode
 + editable text regions
 + check permissions for saving content (ajax request)
 + create DB table for strings
 + correct navigation links in header and footer
 + link social icons
 + solve extra "<p>" problem
 + image resize upon upload
 + edit mode for projects (+add button, edit button)
 + images handling, including missing ones
 + project delete button
 + make sure we have imagemagic at server
 + deploy to server
 + remove "checkout our games"
 + propagate editable regions and save default texts
 + remove space in header (company name)
 + backup db with customer data and project images
 + place DB into 'data' directory @ openshift
 + correct platform icons
 + add "up" button

 - project details page
   + make image responsive
   -- color picker
   -- gradient transparency for image
   + editable description 
   + editable technologies
   + responsive technologies
   + proper list images
   + no resize for screenshots
   + screenshots
   + other projects
   + sayhello page
   + proper main menu entry highlight
   + allow not just jpg
   + change password
   + notifications at change password page
 x recover password
 - allow linking in sidebar
 - do not store image name in DB at all
 - delete project screenshots when project gets deleted
 - favicon
 - disable rich formatting where it is not appropriate
 - install library for editable regions locally
 - install dropzone js script properly
 - projects (re)ordering
 - human-readable URLs for projects


 - learned:
  - image resize, crop and gravity
  - when not to resize (or at least not to crop)
  - find proper time for page reload
  - openshift rocks as freelance hosting
  - serve static from multiple folders
  - using env. variables
  
 - document:
  - $OPENSHIFT_DATA_DIR/img should be created
