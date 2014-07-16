class Sprint < ActiveRecord::Base
  belongs_to :Product
  belongs_to :Project
end
