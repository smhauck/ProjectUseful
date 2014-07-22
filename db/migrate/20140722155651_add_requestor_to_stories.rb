class AddRequestorToStories < ActiveRecord::Migration
  def change
    add_column :stories, :requestor_id, :integer
  end
end
