class Project < ActiveRecord::Base
  belongs_to :creator, class_name: "User", foreign_key: "creator_id"
  belongs_to :owner, class_name: "User", foreign_key: "owner_id"
  
  
  has_many :project_assignments
  has_many :users, through: :project_assignments
  accepts_nested_attributes_for :project_assignments

end
