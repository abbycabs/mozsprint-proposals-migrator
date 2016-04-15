**[ Project Lead ]** <%= facilitator %>
**[ GitHub Repo ]** <%= githubrepo %>
**[ Track ]** <%= track %>
**[ Level ]** <%= level %>

### Description
<%= description %>

***

## Note to the Project Lead
Congrats, <%= facilitator %>! This is your official project listing for the [Mozilla Science Global Sprint 2016](https://www.mozillascience.org/global-sprint-2016). To confirm your submission, please complete the following:

- [<% if (githubrepo) { %>x<% } else { %> <% } %>] Provide a GitHub repository for work and discussion on your project
- [ ] Confirm in a comment that at least one person will be available to review and answer questions on this project from 9-5 in their timezone on both June 2 & 3.

<% if (collaborate == "No") { %>

#### Do you want to become a featured project?
Here are some exercises that will help your project be more inviting to new contributors. We hope you'll try to complete some of these as you prepare for #mozsprint.

If you complete *all* the exercises, your project will be eligible to be featured in our [collection of open source science projects](https://mozillascience.org/collaborate)! Once you've finished this list, contact @acabunoc to submit your project for review.

* [ ] [README.md](http://mozillascience.github.io/working-open-workshop/writing_readme/):
* [ ] [LICENSE](http://choosealicense.com/):
* [ ] [CONTRIBUTING.md](http://mozillascience.github.io/working-open-workshop/contributing/):
* [ ] [Roadmap or an Issue Tracker (with tasks to complete)](http://mozillascience.github.io/working-open-workshop/roadmapping/):
* [ ] [Data Reuse Plan](http://mozillascience.github.io/working-open-workshop/data_reuse/) (if applicable):
* [ ] [Code of Conduct](http://mozillascience.github.io/working-open-workshop/code_of_conduct/):
* [ ] [Personas](http://mozillascience.github.io/working-open-workshop/personas_pathways/):

<% } %>
