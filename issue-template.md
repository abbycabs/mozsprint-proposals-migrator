**[ Project Lead ]** <%= facilitator %>
**[ GitHub Repo ]** <%= githubrepo %>
**[ Track ]** <%= track %>
**[ Level ]** <%= level %>

### Description
<%= description %>

***

## Note to the Project Lead
Congrats, <%= facilitator %>! This is your official project listing for the [Mozilla Science Global Sprint 2016](https://www.mozillascience.org/global-sprint-2016). Please comment on this issue to confirm your project submission and complete the following:

- [<% if (githubrepo) { %>x<% } else { %> <% } %>] Provide a GitHub repository for work and discussion on your project
- [ ] Confirm in a comment that at least one person will be available to review and answer questions on this project from 9-5 in their timezone on both June 2 & 3.

<% if (collaborate == "No") { %>

#### Do you want to become a featured project?
Complete the following exercises to be featured in our [collection of open source science projects](https://mozillascience.org/collaborate)! Once you've completed this, contact @acabunoc and you'll be able to submit your project for review.

* [ ] [README.md](http://mozillascience.github.io/working-open-workshop/writing_readme/):
* [ ] [LICENSE](http://choosealicense.com/):
* [ ] [CONTRIBUTING.md](http://mozillascience.github.io/working-open-workshop/contributing/):
* [ ] [Roadmap or an Issue Tracker (with tasks to complete)](http://mozillascience.github.io/working-open-workshop/roadmapping/):
* [ ] [Data Reuse Plan](http://mozillascience.github.io/working-open-workshop/data_reuse/) (if applicable):
* [ ] [Code of Conduct](http://mozillascience.github.io/working-open-workshop/code_of_conduct/):
* [ ] [Personas](http://mozillascience.github.io/working-open-workshop/personas_pathways/):

<% } %>
