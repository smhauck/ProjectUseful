class Story < ActiveRecord::Base
  belongs_to :product
  belongs_to :project
  belongs_to :sprint
end
