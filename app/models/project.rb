class Project < ActiveRecord::Base
  belongs_to :status, class_name: "ProjectStatusType", foreign_key: "project_status_type_id"
  belongs_to :product
  has_many :stories
end
