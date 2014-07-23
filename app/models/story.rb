class Story < ActiveRecord::Base
  belongs_to :product
  belongs_to :sprint
  belongs_to :status, class_name: "StoryStatusType", foreign_key: "story_status_type_id"
  belongs_to :requestor, class_name: "User", foreign_key: "requestor_id"
  has_many :tasks

  has_many :story_assignments
  has_many :users, through: :story_assignments
  accepts_nested_attributes_for :story_assignments

end
