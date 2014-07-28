class AddCreatorToWiki < ActiveRecord::Migration
  def change
    add_column :wikis, :creator_id, :integer
  end
end
