class Task < ActiveRecord::Base
  belongs_to :Product
  belongs_to :Project
  belongs_to :Sprint
  belongs_to :Story
end
