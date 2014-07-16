class Story < ActiveRecord::Base
  belongs_to :Product
  belongs_to :Project
  belongs_to :Sprint
end
