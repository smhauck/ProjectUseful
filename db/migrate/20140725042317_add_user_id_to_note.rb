class AddUserIdToNote < ActiveRecord::Migration[4.2]
  def change
    add_reference :notes, :user, index: true
  end
end
