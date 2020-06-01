# Multiple Submission Ideas

__This will involve a rewrite of the results page.__

* Write a migration script to get all the goods into Salesforce
* Start storing `select-many` responses as separate responses
* Also start giving metrics a user friendly label for use in the graphs
* Index the data from Salesforce creating an individual ES document for each session that have a common `Response_Id__c`
* On our results page create a component that can draw a graph of results with any number of dimensions
* Instead of hard-coding the metrics, infer them from metrics in the results documents
* Instead of tabs or whatever, allow for some simple filtering to re-issue the query to get other cohorts e.g.
  * your previous sessions,
  * sessions matching your `Sharing_Id__c`,
  * sessions that share specific responses (e.g. Income band, local authority)
* Allow for certain parameters to be passed to our component to setup what questions can be filtered on and what kind of graph should be used
* Final aside: Stop relying on hard-coded fields in Salesforce as much as possible, pretty much any need I can think of for how data needs to be displayed in Salesforce can be done with reports on our "key/value" pair setup