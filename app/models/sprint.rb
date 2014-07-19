class Sprint < ActiveRecord::Base
	has_many :stories
  belongs_to :product
  belongs_to :project
end
