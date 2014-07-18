class Task < ActiveRecord::Base
  belongs_to :product
  belongs_to :project
  belongs_to :sprint
  belongs_to :story
end
