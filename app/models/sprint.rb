class Sprint < ActiveRecord::Base
  has_many :stories
  belongs_to :product
end
