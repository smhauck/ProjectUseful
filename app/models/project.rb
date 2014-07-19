class Project < ActiveRecord::Base
  belongs_to :product
  has_many :stories
end
