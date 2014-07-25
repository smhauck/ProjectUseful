class Issue < ActiveRecord::Base
  belongs_to :product
  belongs_to :requestor, class_name: "User", foreign_key: "requestor_id"
  belongs_to :status, class_name: "IssueStatusType", foreign_key: "issue_status_type_id"

  belongs_to :issue_status_type
end
